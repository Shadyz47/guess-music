package com.projectb.musicback.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class    Songs {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "song_id")
    private Long id;

    private String title;

    private String artist;

    private String genre;

    @Column(name = "audio_url", nullable = false)
    private String audio_url;

    @Column(name = "image_url")
    private String image_url;

    @Column(name = "is_active", nullable = false)
    private boolean active;
}
