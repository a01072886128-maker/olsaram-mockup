package com.olsaram.backend.repository;

import com.olsaram.backend.entity.MenuItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {

    List<MenuItem> findAllByOwnerIdOrderByCreatedAtDesc(Long ownerId);
}
