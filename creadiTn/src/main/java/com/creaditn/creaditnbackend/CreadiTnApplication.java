package com.creaditn.creaditnbackend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class CreadiTnApplication {

    public static void main(String[] args) {
        SpringApplication.run(CreadiTnApplication.class, args);
    }

}
