package com.projectb.musicback.dto.request;

public record SongInfoRequest(
        String title,
        String artist,
        String genre
) {
}
