package com.projectb.musicback.mapper;

import com.projectb.musicback.dto.request.SongRequest;
import com.projectb.musicback.entity.Songs;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface songMapper {

    Songs toEntity(SongRequest songRequest);
}
