package com.projectb.musicback.service;


import com.projectb.musicback.entity.Songs;

import java.util.List;

public interface SongService {
    List<Songs> getAllSongs(String genre);
}
