package com.coursemanagement.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.coursemanagement.model.entity.Category;

import java.util.List;

public interface CategoryService extends IService<Category> {

    List<Category> listByUserId(Long userId);

    Category createCategory(String name, Long userId);

    void removeByIdAndUserId(Long id, Long userId);
}
