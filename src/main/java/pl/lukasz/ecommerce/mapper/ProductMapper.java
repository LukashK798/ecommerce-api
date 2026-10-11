package pl.lukasz.ecommerce.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import pl.lukasz.ecommerce.dto.ProductRequest;
import pl.lukasz.ecommerce.dto.ProductResponse;
import pl.lukasz.ecommerce.model.Product;

@Mapper(componentModel = "spring")
public interface ProductMapper {
    Product toEntity(ProductRequest productRequest);
    ProductResponse toDto(Product product);
    void updateEntityFromDto(ProductRequest productRequest, @MappingTarget Product product);
}
