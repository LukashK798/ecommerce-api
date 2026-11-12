package pl.lukasz.ecommerce.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import pl.lukasz.ecommerce.dto.ProductRequest;
import pl.lukasz.ecommerce.dto.ProductResponse;
import pl.lukasz.ecommerce.service.ProductService;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")

public class ProductController {
    private final ProductService productService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ProductResponse createProduct(@Valid @RequestBody ProductRequest request){
        return productService.createProduct(request);
    }

    @GetMapping
    public List<ProductResponse> getAllProducts(){
        return productService.getAllProducts();
    }

    @GetMapping("/{id}")
    public ProductResponse getProductById(@PathVariable Long id){
        return productService.getProductById(id);
    }

    @PutMapping("/{id}")
    public ProductResponse updateProduct(@PathVariable Long id, @Valid @RequestBody ProductRequest request){
        return productService.updateProduct(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteProduct(@PathVariable Long id){
        productService.deleteProduct(id);
    }

    @PostMapping("/{id}/purchase")
    public ProductResponse purchaseProduct(@PathVariable Long id, @RequestParam(defaultValue = "1") int quantity){
        return productService.purchaseProduct(id, quantity);
    }

    @GetMapping("/low-stock")
    public List<ProductResponse> getLowStockProducts(@RequestParam(defaultValue = "5") int threshold){
        return productService.getLowStockProducts(threshold);
    }
}
























