package pl.lukasz.ecommerce.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pl.lukasz.ecommerce.model.Product;

public interface ProductRepository extends JpaRepository<Product, Long> {}
