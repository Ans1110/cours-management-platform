package com.coursemanagement.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.coursemanagement.exception.ResourceNotFoundException;
import com.coursemanagement.mapper.CategoryMapper;
import com.coursemanagement.model.entity.Category;
import com.coursemanagement.service.CategoryService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class CategoryServiceImpl extends ServiceImpl<CategoryMapper, Category> implements CategoryService {

    @Override
    public List<Category> listByUserId(Long userId) {
        return list(new LambdaQueryWrapper<Category>()
                .eq(Category::getUserId, userId)
                .orderByAsc(Category::getName));
    }

    @Override
    public Category createCategory(String name, Long userId) {
        Category category = new Category();
        category.setName(name);
        category.setUserId(userId);
        category.setCreatedAt(LocalDateTime.now());
        save(category);
        return category;
    }

    @Override
    public void removeByIdAndUserId(Long id, Long userId) {
        Category category = getOne(new LambdaQueryWrapper<Category>()
                .eq(Category::getId, id)
                .eq(Category::getUserId, userId));
        if (category == null) {
            throw new ResourceNotFoundException("Category not found with id: " + id);
        }
        removeById(id);
    }
}
