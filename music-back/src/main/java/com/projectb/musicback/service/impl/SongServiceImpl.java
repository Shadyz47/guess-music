package com.projectb.musicback.service.impl;

import com.projectb.musicback.dto.request.SongInfoRequest;
import com.projectb.musicback.dto.request.SongRequest;
import com.projectb.musicback.entity.Songs;
import com.projectb.musicback.repository.SongRepository;
import com.projectb.musicback.service.SongService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Service
public class SongServiceImpl implements SongService {
    private static final Set<String> AUDIO_EXTENSIONS = Set.of("mp3", "wav", "ogg", "m4a", "aac", "flac");
    private static final Set<String> IMAGE_EXTENSIONS = Set.of("jpg", "jpeg", "png", "webp", "gif");

    private final SongRepository songRepo;

    @Value("${app.upload.audio-directory}")
    private String audioDirectory;

    @Value("${app.upload.image-directory}")
    private String imageDirectory;

    public SongServiceImpl(SongRepository songRepo) {
        this.songRepo = songRepo;
    }

    @Override
    public List<Songs> getAllSongs(String genre) {
        if(genre == null || genre.isBlank()){
            return songRepo.findByActiveTrueOrderByIdDesc();
        }

        return songRepo.findByGenreIgnoreCaseAndActiveTrueOrderByIdDesc(genre.trim());
    }

    @Override
    @Transactional
    public Songs addSong(SongRequest request) {
        String title = requiredText(request.title(), "title");
        String artist = requiredText(request.artist(), "artist");
        String genre = requiredText(request.genre(), "genre");

        String audioExtension = extension(request.audio(), AUDIO_EXTENSIONS, "audio");
        String imageExtension = request.image() == null || request.image().isEmpty()
                ? null : extension(request.image(), IMAGE_EXTENSIONS, "image");

        Path audioPath = null;
        Path imagePath = null;

        try {
            audioPath = saveFile(request.audio(), audioDirectory, audioExtension);
            if (imageExtension != null) {
                imagePath = saveFile(request.image(), imageDirectory, imageExtension);
            }

            Songs song = new Songs();
            song.setTitle(title);
            song.setArtist(artist);
            song.setGenre(genre);
            song.setAudio_url("/audio/" + audioPath.getFileName());

            if (imagePath != null) {
                song.setImage_url("/image/" + imagePath.getFileName());
            }
            song.setActive(true);
            return songRepo.save(song);

        } catch (IOException e) {
            deleteQuietly(audioPath);
            deleteQuietly(imagePath);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Không thể lưu file bài hát", e);
        } catch (RuntimeException e) {
            deleteQuietly(audioPath);
            deleteQuietly(imagePath);
            throw e;
        }
    }

    @Override
    public String deleteSong(Long id) {
        Songs song = songRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Bài hát không tồn tại"));

        Path audioPath = Path.of(audioDirectory).resolve(song.getAudio_url().substring("/audio/".length()));
        Path imagePath = song.getImage_url() != null
                ? Path.of(imageDirectory).resolve(song.getImage_url().substring("/image/".length()))
                : null;

        deleteQuietly(audioPath);
        deleteQuietly(imagePath);

        songRepo.delete(song);

        return "Delete Song with id: " + id + " successfully";
    }

    @Override
    public Songs updateSong(Long id, SongInfoRequest songInfoRequest) {

        Songs song = songRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Bài hát không tồn tại"));

        song.setTitle(songInfoRequest.title());
        song.setArtist(songInfoRequest.artist());
        song.setGenre(songInfoRequest.genre());

        return songRepo.save(song);
    }

    private String requiredText(String value, String field) {
        if (value == null || value.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Thiếu " + field);
        }
        return value.trim();
    }

    private String extension(MultipartFile file, Set<String> allowed, String field) {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Thiếu file " + field);
        }
        String name = file.getOriginalFilename();
        int dot = name == null ? -1 : name.lastIndexOf('.');
        String ext = dot < 0 ? "" : name.substring(dot + 1).toLowerCase(Locale.ROOT);
        if (!allowed.contains(ext)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Định dạng file " + field + " không hợp lệ");
        }
        return ext;
    }

    private Path saveFile(MultipartFile file, String directory, String extension) throws IOException {
        Path folder = Path.of(directory).toAbsolutePath().normalize();
        Files.createDirectories(folder);
        Path target = folder.resolve(UUID.randomUUID() + "." + extension);
        try (var input = file.getInputStream()) {
            Files.copy(input, target, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            deleteQuietly(target);
            throw e;
        }
        return target;
    }

    private void deleteQuietly(Path path) {
        if (path != null) {
            try {
                Files.deleteIfExists(path);
            } catch (IOException ignored) {

            }
        }
    }
}
