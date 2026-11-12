package pl.lukasz.ecommerce.controller;

import io.restassured.http.ContentType;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import pl.lukasz.ecommerce.IntegrationTestBase;
import pl.lukasz.ecommerce.dto.ProductResponse;
import pl.lukasz.ecommerce.model.Product;
import pl.lukasz.ecommerce.repository.ProductRepository;
import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;
import static io.restassured.RestAssured.given;

public class ProductControllerIntegrationTest extends IntegrationTestBase {

    @Autowired
    private ProductRepository productRepository;

    @Test
    void shouldGetProductByIdFromDatabase() {
        Product product = new Product();
        product.setName("MacBook Pro");
        product.setDescription("16GB RAM 512GB");
        product.setPrice(new BigDecimal("7500.00"));
        product.setStockQuantity(10);

        Product savedProduct = productRepository.save(product);

        ProductResponse response = given()
                .contentType(ContentType.JSON)
                .when()
                .get("/api/products/{id}", savedProduct.getId())
                .then()
                .statusCode(200)
                .extract()
                .as(ProductResponse.class);

        assertThat(response).isNotNull();
        assertThat(response.getId()).isEqualTo(savedProduct.getId());
        assertThat(response.getName()).isEqualTo(savedProduct.getName());
        assertThat(response.getStockQuantity()).isEqualTo(savedProduct.getStockQuantity());
    }
}
