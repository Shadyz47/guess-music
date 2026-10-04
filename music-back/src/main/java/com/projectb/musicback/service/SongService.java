package com.projectb.musicback.service;


import com.projectb.musicback.dto.request.SongInfoRequest;
import com.projectb.musicback.dto.request.SongRequest;
import com.projectb.musicback.entity.Songs;

import java.util.List;

public interface SongService {
    List<Songs> getAllSongs(String genre);

    Songs addSong(SongRequest request);

    String deleteSong(Long id);

    Songs updateSong(Long id, SongInfoRequest songInfoRequest);
}
