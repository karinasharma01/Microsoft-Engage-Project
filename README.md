# Microsoft Engage 2021 Project: Microsoft Teams Clone.
# TABLE OF CONTENTS
- Introduction
- Product Description
- Technologies
- Launch
- User Journey
- Support
# INTRODUCTION
This web application is made as a part of Microsoft Engage'21 as a solution to the challenge of making a Microsoft Teams Clone.Microsoft Teams is a proprietary business communication platform developed by Microsoft, as part of the Microsoft 365 family of products.

# Product Description:

# Background:
Microsoft Engage is an Engagement & Mentorship Program launched by Microsoft IDC aimed at giving students a chance to be mentored by Microsoft and be a part of AMA Sessions, Webinars and Leader talks delivered by Microsoft employees.This year's theme was Agile Methodology.
Agile development is a mindset whose values and principles provide guidance on how to create and respond to change and how to deal with uncertainty.

It is a way of dealing with, and ultimately succeeding in, an uncertain and turbulent environment. It's really about thinking through how you can understand what's going on in the environment that you're in today, identify what uncertainty you're facing, and figure out how you can adopt to that as you go along.Agile scrum methodology is a project management system that relies on incremental development. Each iteration consists of two- to four-week sprints, where each sprint’s goal is to build the most important features first and come out with a potentially deliverable product. More features are built into the product in subsequent sprints and are adjusted based on stakeholder and customer feedback between sprints.
As a part of this journey, I developed a web application that allows video chat between different users.The users can also communicate with each other via sending messages to each other in a chat box.The prototype also supports the functionality to share a user's screen with the other participants & allows the users to start/stop their video & mute/unmute themselves.

# User Journey
As soon as the user visits the website,the home page of the application gets rendered.A new user needs to create an account before using the application while an exisiting user can signin.
![image](https://user-images.githubusercontent.com/68894444/125161896-9f63c700-e1a2-11eb-8bff-bbb337d63f4f.png)

On clicking "SignUp For Free",the new user gets redirected to the signup route wherein the user is asked to enter his/her details & create a new account.The user can also sign up via Google.

![F103863C-5BFA-4FC6-A73D-CAC22FABD816](https://user-images.githubusercontent.com/68894444/125245425-2e412280-e30e-11eb-92d8-04f895cedfaa.GIF)

Every time a user registers their details get stored in a database usersDB.MongoDB is used to serve this purpose.

An existing user can simply sign in their account or signin with their Google Account.
![C1740AFA-1FD5-4F92-B7EB-3F488AB2AC1B](https://user-images.githubusercontent.com/68894444/125246222-2170fe80-e30f-11eb-9cd7-e676ea5adec2.GIF)


After the users get logged in they are redirected to the user webpage.The user can setup a new video call or join a video call by entering the URL shared with them by some different user.The user can also logout from their account and would be redirected to the home page of the application.

![image](https://user-images.githubusercontent.com/68894444/125162395-316ccf00-e1a5-11eb-80cd-8270ad0fefb7.png)




# Technologies:
- HTML
- CSS
- JavaScript
- EJS
- MongoDB
- Node.js
- Express
- jQuery
- Socket.IO
- Passport.js
- Google OAuth20
- UUID

To enable real-time,bidirectional and event-based communication between the browser & the server Socket.IO has been used.PeerJS simplifies WebRTC peer-to-peer data,video and audio calls.It wraps the browser WebRTC implementation to provide a configurable and easy to use P2P connection API and uses just an ID to connect and stream to a remote peer.UUID has been used to generate random unique URLs.For authentication purposes,Passport has been used as an authentication middleware for Node.js. It has a set of various strategies to support authentication using a username & password and also Google OAuth.

# Launch
Visit https://teams-clone-karina.herokuapp.com/ to access the deployed application.

# Support
For any queries or problems that might arise with regards to the project, the author can be contacted at karinasharma1200@gmail.com
