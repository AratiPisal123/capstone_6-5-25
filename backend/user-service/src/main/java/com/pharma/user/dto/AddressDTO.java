package com.pharma.user.dto;

import com.pharma.user.entity.AddressType;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AddressDTO {
    private Long id;

    @NotBlank
    private String fullName;

    @NotBlank
    private String addressLine1;

    private String addressLine2;

    @NotBlank
    private String city;

    @NotBlank
    private String state;

    @NotBlank
    private String zipCode;

    private String country = "USA";

    @NotBlank
    private String phone;

    private AddressType type = AddressType.HOME;
    private Boolean isDefault = false;
}
