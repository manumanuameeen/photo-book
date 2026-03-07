export interface IMapper<TDto, TEntity, TResponse> {
  fromDto(dto: TDto): Partial<TEntity>;
  toResponse(entity: TEntity): TResponse;
}
export interface IGenericMapper<TEntity> {
  toResponse(entity: TEntity): Record<string, unknown>;
}
