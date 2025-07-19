package com.yourorg.livestream.signaling;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SignalMessage {
    private String type; // "offer", "answer", "candidate"
    private String room; // Room/restaurant ID
    private String from; // Sender ID (optional)
    private String to;   // Receiver ID (optional)
    private Object data; // SDP or ICE candidate
} 