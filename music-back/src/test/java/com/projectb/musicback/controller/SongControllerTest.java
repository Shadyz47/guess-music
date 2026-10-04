package com.projectb.musicback.controller;

import com.projectb.musicback.dto.request.SongRequest;
import com.projectb.musicback.entity.Songs;
import com.projectb.musicback.service.SongService;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.mockito.ArgumentCaptor.forClass;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class SongControllerTest {
    @Test
    void acceptsMultipartSongFields() throws Exception {
        SongService service = mock(SongService.class);
        when(service.addSong(any())).thenReturn(new Songs());
        var mvc = MockMvcBuilders.standaloneSetup(new SongController(service)).build();

        mvc.perform(multipart("/api/songs")
                        .file(new MockMultipartFile("audio", "sample.mp3", "audio/mpeg", new byte[]{1, 2, 3}))
                        .file(new MockMultipartFile("image", "cover.png", "image/png", new byte[]{4}))
                        .param("title", "Song")
                        .param("artist", "Artist")
                        .param("genre", "Vpop"))
                .andExpect(status().isOk());

        var request = forClass(SongRequest.class);
        verify(service).addSong(request.capture());
        assertEquals("Song", request.getValue().title());
        assertEquals("Artist", request.getValue().artist());
        assertEquals("Vpop", request.getValue().genre());
        assertNotNull(request.getValue().audio());
        assertNotNull(request.getValue().image());
    }
}
