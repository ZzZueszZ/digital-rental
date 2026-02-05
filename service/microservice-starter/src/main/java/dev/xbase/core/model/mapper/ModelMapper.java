package dev.xbase.core.model.mapper;

import java.util.List;

public interface ModelMapper<M, D> {
    D toDto(M model);

    M toModel(D dto);

    List<M> toModel(List<D> dtoList);

    List<D> toDto(List<M> modelList);

}
