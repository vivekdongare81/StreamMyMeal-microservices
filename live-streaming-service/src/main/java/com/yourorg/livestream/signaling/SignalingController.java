package com.yourorg.livestream.signaling;

import org.springframework.messaging.handler.annotation.*;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class SignalingController {
    private final SimpMessagingTemplate messagingTemplate;

    public SignalingController(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    // Client sends to /app/signal
    @MessageMapping("/signal")
    public void signal(@Payload SignalMessage message) {
        // Broadcast to all in the room except sender
        messagingTemplate.convertAndSend("/topic/" + message.getRoom(), message);
    }
} 