package pl.lukasz.ecommerce.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import pl.lukasz.ecommerce.exception.OutOfStockException;
import pl.lukasz.ecommerce.exception.ProductNotFoundException;
import pl.lukasz.ecommerce.mapper.ProductMapper;
import pl.lukasz.ecommerce.model.Product;
import pl.lukasz.ecommerce.repository.ProductRepository;
import java.util.Optional;

import static org.assertj.core.api.AssertionsForClassTypes.assertThatThrownBy;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private ProductMapper productMapper;

    @InjectMocks
    private ProductService productService;

    @Test
    void getProductById_whenProductDoesNotExist_shouldThrowException(){
        when(productRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> productService.getProductById(999L))
                .isInstanceOf(ProductNotFoundException.class)
                .hasMessageContaining("Product with id 999 not found");
    }

    @Test
    void purchaseProduct_whenStockIsInsufficient_shouldThrowException(){
        Product product = new Product();
        product.setId(1L);
        product.setName("Laptop");
        product.setStockQuantity(2);

        when(productRepository.findById(product.getId())).thenReturn(Optional.of(product));

        assertThatThrownBy(() -> productService.purchaseProduct(product.getId(), 5))
                .isInstanceOf(OutOfStockException.class)
                .hasMessageContaining("Not enough stock for product: ", product.getName());

        verify(productRepository, never()).save(any());
    }
}
