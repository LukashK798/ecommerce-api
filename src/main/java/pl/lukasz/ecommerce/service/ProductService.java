package pl.lukasz.ecommerce.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import pl.lukasz.ecommerce.dto.ProductRequest;
import pl.lukasz.ecommerce.dto.ProductResponse;
import pl.lukasz.ecommerce.exception.ProductNotFoundException;
import pl.lukasz.ecommerce.mapper.ProductMapper;
import pl.lukasz.ecommerce.model.Product;
import pl.lukasz.ecommerce.repository.ProductRepository;

import java.util.List;

@Service
@RequiredArgsConstructor

public class ProductService {
    private final ProductRepository productRepository;
    private final ProductMapper productMapper;

    public ProductResponse createProduct(ProductRequest request){
        Product product = productMapper.toEntity(request);
        return productMapper.toDto(productRepository.save(product));
    }

    public List<ProductResponse> getAllProducts(){
        return productRepository.findAll()
                .stream()
                .map(productMapper::toDto)
                .toList();
    }

    public ProductResponse getProductById(Long id){
        return productMapper.toDto(
                productRepository.findById(id)
                        .orElseThrow(() -> new ProductNotFoundException("Product with id " + id + " not found"))
        );
    }

    public ProductResponse updateProduct(Long id, ProductRequest request){
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ProductNotFoundException("Product with id " + id + " not found"));
        productMapper.updateEntityFromDto(request, product);
        return productMapper.toDto(productRepository.save(product));
    }

    public void deleteProduct(Long id){
        if (!productRepository.existsById(id)) {
            throw new ProductNotFoundException("Product with id " + id + " not found");
        }
        productRepository.deleteById(id);
    }
}
