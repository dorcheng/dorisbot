# Meet DorisBot

DorisBot is a smart chatbot that was built with Wit.ai and Messenger Platform. To make things more interesting, she was built with the goal of speaking like Doris Cheng (me!).

# Natural Language Processing

Natural language processing is the ability of a computer program to understand human speech as it is spoken. Wit.ai is a natural language processing tool that provides bot makers with the ability to build models using entities and values. Entities categorizes user intent and values are the associated values. DorisBot uses seven main entities: greeting, goodbye, question, hobbies, currently_doing, schedule_food_date, schedule_hangout. Every time a new input gets sent to her, Wit.ai will process it and respond with a JSON object that contains a confidence value. The confidence value shows how sure or confident Wit is, that it extracted the entity correctly.


# How DorisBot chooses what to respond with

The goal for DorisBot was to increase the percentage that she would respond with an actual message rather than the default message, whenever she receives a new input Wit cannot categorize into an entity. To add a personal touch (and because I did not want to continue manually adding entities to account for every single edge case), I fed DorisBot two years worth of text messages to make DorisBot sound like me. I converted my text messages (originally in XML format) into JSON, and mapped everything so that every message had a corresponding reply from me (key-value message-response pairs). To determine what DorisBot would reply with, I used an algorithm called the Levenshtein distance, which calculates how different two strings are. Whenever there is a new user input, DorisBot will first be processed by Wit.ai. If Wit fails to process it, DorisBot will fall back to checking my text messages and using the Levenshtein distance to see if there is a similar key in my dictionary of key-value pairs. If there is a similar key, DorisBot will respond with that key's value. Otherwise, DorisBot will respond with the default response.

 
