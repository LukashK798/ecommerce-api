package pl.lukasz.ecommerce.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Getter
@Setter
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@NoArgsConstructor
@Table(name = "products")

public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "product_seq")
    @SequenceGenerator(name = "product_seq", sequenceName = "products_sequence",  allocationSize = 1)
    @EqualsAndHashCode.Include
    private Long id;

    private String name;

    private String description;

    private BigDecimal price;

    private int stockQuantity;
}
