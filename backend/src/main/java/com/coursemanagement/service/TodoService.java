package com.coursemanagement.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.coursemanagement.model.entity.Todo;

import java.util.List;

public interface TodoService extends IService<Todo> {

    List<Todo> listByUserId(Long userId);

    List<Todo> listByUserIdAndStatus(Long userId, String status);

    Todo getByIdAndUserId(Long id, Long userId);

    void updateByIdAndUserId(Todo todo, Long userId);

    void removeByIdAndUserId(Long id, Long userId);

    Todo updateStatus(Long id, String status, Long userId);
}
