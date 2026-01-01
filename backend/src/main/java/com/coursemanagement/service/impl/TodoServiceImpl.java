package com.coursemanagement.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.coursemanagement.exception.ResourceNotFoundException;
import com.coursemanagement.mapper.TodoMapper;
import com.coursemanagement.model.entity.Todo;
import com.coursemanagement.service.TodoService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class TodoServiceImpl extends ServiceImpl<TodoMapper, Todo> implements TodoService {

    @Override
    public List<Todo> listByUserId(Long userId) {
        return list(new LambdaQueryWrapper<Todo>()
                .eq(Todo::getUserId, userId)
                .orderByDesc(Todo::getCreatedAt));
    }

    @Override
    public List<Todo> listByUserIdAndStatus(Long userId, String status) {
        return list(new LambdaQueryWrapper<Todo>()
                .eq(Todo::getUserId, userId)
                .eq(Todo::getStatus, status)
                .orderByDesc(Todo::getCreatedAt));
    }

    @Override
    public Todo getByIdAndUserId(Long id, Long userId) {
        Todo todo = getOne(new LambdaQueryWrapper<Todo>()
                .eq(Todo::getId, id)
                .eq(Todo::getUserId, userId));
        if (todo == null) {
            throw new ResourceNotFoundException("Todo not found with id: " + id);
        }
        return todo;
    }

    @Override
    public void updateByIdAndUserId(Todo todo, Long userId) {
        Todo existing = getByIdAndUserId(todo.getId(), userId);
        todo.setUserId(existing.getUserId());
        todo.setCreatedAt(existing.getCreatedAt());
        todo.setUpdatedAt(LocalDateTime.now());
        updateById(todo);
    }

    @Override
    public void removeByIdAndUserId(Long id, Long userId) {
        getByIdAndUserId(id, userId); // Verify ownership
        removeById(id);
    }

    @Override
    public Todo updateStatus(Long id, String status, Long userId) {
        Todo todo = getByIdAndUserId(id, userId);
        todo.setStatus(status);
        todo.setUpdatedAt(LocalDateTime.now());
        updateById(todo);
        return todo;
    }
}
