package com.pharma.user.service;

import com.pharma.user.dto.AddressDTO;
import com.pharma.user.entity.Address;
import com.pharma.user.entity.User;
import com.pharma.user.repository.AddressRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.NotFoundException;

import java.util.List;

@ApplicationScoped
public class AddressService {

    @Inject
    AddressRepository addressRepository;

    @Inject
    UserService userService;

    public List<Address> listByUser(Long userId) {
        return addressRepository.findByUserId(userId);
    }

    public AddressDTO toDTO(Address address) {
        AddressDTO dto = new AddressDTO();
        dto.setId(address.getId());
        dto.setFullName(address.getFullName());
        dto.setAddressLine1(address.getAddressLine1());
        dto.setAddressLine2(address.getAddressLine2());
        dto.setCity(address.getCity());
        dto.setState(address.getState());
        dto.setZipCode(address.getZipCode());
        dto.setCountry(address.getCountry());
        dto.setPhone(address.getPhone());
        dto.setType(address.getType());
        dto.setIsDefault(address.getIsDefault());
        return dto;
    }

    @Transactional
    public AddressDTO create(Long userId, AddressDTO request) {
        User user = userService.getById(userId);
        Address address = new Address();
        address.setUser(user);
        apply(address, request);
        addressRepository.persist(address);

        if (Boolean.TRUE.equals(request.getIsDefault())) {
            setDefault(userId, address.getId());
            address = addressRepository.findById(address.getId());
        }

        return toDTO(address);
    }

    @Transactional
    public AddressDTO update(Long userId, Long addressId, AddressDTO request) {
        Address address = addressRepository.findByIdOptional(addressId)
            .orElseThrow(() -> new NotFoundException("Address not found"));
        if (!address.getUser().getId().equals(userId)) {
            throw new NotFoundException("Address not found");
        }

        apply(address, request);

        if (Boolean.TRUE.equals(request.getIsDefault())) {
            setDefault(userId, addressId);
        }
        return toDTO(address);
    }

    @Transactional
    public void delete(Long userId, Long addressId) {
        Address address = addressRepository.findByIdOptional(addressId)
            .orElseThrow(() -> new NotFoundException("Address not found"));
        if (!address.getUser().getId().equals(userId)) {
            throw new NotFoundException("Address not found");
        }
        addressRepository.delete(address);
    }

    @Transactional
    public void setDefault(Long userId, Long addressId) {
        List<Address> addresses = addressRepository.findByUserId(userId);
        for (Address a : addresses) {
            a.setIsDefault(a.getId().equals(addressId));
        }
    }

    private void apply(Address address, AddressDTO request) {
        address.setFullName(request.getFullName());
        address.setAddressLine1(request.getAddressLine1());
        address.setAddressLine2(request.getAddressLine2());
        address.setCity(request.getCity());
        address.setState(request.getState());
        address.setZipCode(request.getZipCode());
        address.setCountry(request.getCountry());
        address.setPhone(request.getPhone());
        address.setType(request.getType());
        address.setIsDefault(request.getIsDefault());
    }
}
