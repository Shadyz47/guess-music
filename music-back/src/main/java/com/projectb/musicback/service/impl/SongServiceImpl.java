package com.projectb.musicback.service.impl;

import com.projectb.musicback.entity.Songs;
import com.projectb.musicback.repository.SongRepository;
import com.projectb.musicback.service.SongService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SongServiceImpl implements SongService {

    private final SongRepository songRepo;

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
}
