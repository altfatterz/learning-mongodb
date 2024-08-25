package com.github.altfatterz.mongo;

import org.springframework.boot.SpringApplication;

public class TestMongoDBApp {

    public static void main(String[] args) {
        SpringApplication.from(MongoDBApp::main)
                .with(TestMongoDBAppConfig.class).run(args);
    }
}
