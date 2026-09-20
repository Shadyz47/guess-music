package com.projectb.musicback.controller;

import com.projectb.musicback.entity.Songs;
import com.projectb.musicback.service.SongService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/songs")
public class SongController {
    private final SongService songService;

    public SongController(SongService songService) {
        this.songService = songService;
    }

    @Value("${app.upload.audio-directory}")
    private String audioDirectory;

    @GetMapping
    public List<Songs> getAllSongs(@RequestParam(required = false) String genre) {
        return songService.getAllSongs(genre);
    }
}
