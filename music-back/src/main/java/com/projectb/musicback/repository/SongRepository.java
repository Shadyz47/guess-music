package com.projectb.musicback.repository;

import com.projectb.musicback.entity.Songs;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SongRepository extends JpaRepository<Songs, Long> {
    List<Songs> findByActiveTrueOrderByIdDesc();

    List<Songs> findByGenreIgnoreCaseAndActiveTrueOrderByIdDesc(String trim);
}
