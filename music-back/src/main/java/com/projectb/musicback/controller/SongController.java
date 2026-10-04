package com.projectb.musicback.controller;

import com.projectb.musicback.dto.request.SongInfoRequest;
import com.projectb.musicback.dto.request.SongRequest;
import com.projectb.musicback.entity.Songs;
import com.projectb.musicback.service.SongService;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/songs")
public class SongController {
    private final SongService songService;

    public SongController(SongService songService) {
        this.songService = songService;
    }

    @GetMapping
    public List<Songs> getAllSongs(@RequestParam(required = false) String genre) {
        return songService.getAllSongs(genre);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Songs addSong(@ModelAttribute SongRequest songRequest) {
        return songService.addSong(songRequest);
    }

    @PutMapping("/{id}")
    public Songs updateSong(@PathVariable Long id, @RequestBody SongInfoRequest songInfoRequest) {
        return songService.updateSong(id, songInfoRequest);
    }

    @DeleteMapping("/{id}")
    public String deleteSong(@PathVariable Long id) {
        return songService.deleteSong(id);
    }
}
