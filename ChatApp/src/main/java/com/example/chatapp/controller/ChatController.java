package com.example.chatapp.controller;


import org.springframework.ai.chat.client.ChatClient;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
public class ChatController {

	private final ChatClient chatClient;

	// Spring Boot will automatically wire in the configured ChatClient.
	public ChatController(ChatClient.Builder chatClientBuilder) {
		this.chatClient = chatClientBuilder.build();
	}

	@GetMapping("/ai/chat")
	public String generateResponse(@RequestParam("prompt") String message) {
		return chatClient.prompt()
				.user(message)
				.call()
				.content();
	}
}
