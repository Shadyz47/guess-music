package com.projectb.musicback.dto.request;

import org.springframework.web.multipart.MultipartFile;

public record SongRequest(
        String title,
        String artist,
        String genre,
        MultipartFile audio,
        MultipartFile image
) {
}
