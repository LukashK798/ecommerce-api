package pl.lukasz.ecommerce.controller;

import io.restassured.RestAssured;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import pl.lukasz.ecommerce.model.Product;
import pl.lukasz.ecommerce.repository.ProductRepository;

import static org.hamcrest.Matchers.equalTo;

import java.math.BigDecimal;

import static io.restassured.RestAssured.given;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Testcontainers
public class ProductControllerIntegrationTest {

    @Container
    @ServiceConnection
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:latest");

    @LocalServerPort
    private int port;

    @BeforeEach
    public void setUp() {
        RestAssured.port = port;
    }

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

        given()
                .contentType(ContentType.JSON)
                .when()
                .get("/api/products/{id}", savedProduct.getId())
                .then()
                .statusCode(200)
                .body("id", equalTo(savedProduct.getId().intValue()))
                .body("name", equalTo(savedProduct.getName()))
                .body("stockQuantity", equalTo(savedProduct.getStockQuantity()));
    }
}
