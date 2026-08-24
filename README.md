Tech Stack: C#, ASP.NET Core Web API, Entity Framework Core, SQL Server, React, Material UI (MUI), SignalR

Set Up Instructions:

1. Clone the Repository
2. Create the DB
  -  If Using Visual Studio under Tools, NuGet Package Manager, Package Manager Console, RUN:
    1. Add-Migration InitialCreate 
    2. Update-Database
4. In React Front End Folder, RUN: npm install
5. Start Front End -> cd ClientFolder, RUN: npm run dev
6. Once both applications are running these are the working functionalities:
    - Enter a username to join the chat.
    - The user will be added to the database if they don't already exist. 
    - Existing users will be shown with their online/offline status.
    - Open another browser tab or window and join as another user.
    - Send messages, and add new users to verify real-time updates through SignalR.
    - Close a browser tab to verify the user's offline status updates.
    - 
# AI Usage
I used ChatGPT as an AI assistant during development of this project.

I primarily used it to:
- Explain SignalR concepts.
- Help troubleshoot compilation and runtime errors.
- Review implementation approaches and edge cases.

I used AI as a development and learning aid, particularly when debugging and working through unfamiliar concepts.
Example of some concepts i prompted AI about:
- help set up the initial EF Core DbContext and configuration, how to create migrations and update the db
- helped set up my program.cs to include the proper mappings to the controller, services, db, chathub, and lastly the CORS policy
- helped me create my custom ChatHub class, which inherits from SignalR's Hub class.
- helped me implement signalR for some events such as 1) when a user joins a chat 2) when a message is sent 3) when user connects/disconnects

Architecture and Design Approach

The application is organized into a React frontend and an ASP.NET backend. 
On the backend, I have separate user and messages controllers that handle
endpoints for Getting Messages/Users and Creating new users/messages.
My service layer acts as the middleman between my controllers and the database. 
For example, my MessageService has methods for retrieving messages and creating 
messages from the Database. It uses the EF Core DbContext to query or save the data, 
and then converts the database models into classes that I can safely return to the 
frontend. My ChatHub handles the real time functionality. I inherited from SignalR's
Hub class which gives me access to the current connection and connected clients, once 
a user joins I associate their UserId with their signalR Connection ID in a dictionary. 
I used a set of connections IDs per UserId to allow for multiple browsers/connections with the 
same user. When a connection disconnects, SignalR automatically calls OnDisconnectedAsync, where 
I remove that connection. The user is only considered offline when they no longer have any active connections.
I then use SignalR events to notify the other clients so their UI can update in real time.
Each connected React client has a SignalR connection and registers listeners for events 
such as Recieving a message, User going online, user going offline. When an event is received, 
the corresponding React state is updated, causing the UI to update without requiring a page 
refresh. Users and messages are persisted in SQL Server. The User model includes a name, 
userId, list of messages, and a join date. It also includes a normalized name, which I 
normalize consistently and enforce with a unique database constraint to prevent duplicate
usernames regardless of casing. The Message Model contains a messageId, userId, message body, and also a timestamp. 
A user can have many messages. 

Scenarios to Consider 

1. Same User Opens the App in two tabs, then closes one of them. In my ChatHub.cs I look out for this by mapping each user ID to a set of SignalR connection IDs. When a user opens two tabs, each tab gets its own connection ID, so both are stored under the same user. When one tab closes, OnDisconnectedAsync removes only that connection ID. I only consider the user offline when their set of connection IDs becomes empty. This prevents the user from incorrectly appearing offline just because one of their tabs or devices disconnected.
   
2. Refreshing the page resets the React client state, so the user is 
returned to the join screen. Re-entering the same name reconnects them to
their existing user, since the user is persisted in the db. If had more time can 
work on saving to local storage, so refreshing page does not log them out.
-Update 8/23/2026
    1. Added session storage restoration. When the page is refreshed, the app
  checks session storage for the saved user ID. If a user is found, the
  React state is restored and a new SignalR connection is established for
  that user.

    2. While implementing this, I noticed that the useEffect responsible for
  restoring the user was running twice during development. This caused two
  SignalR connections to be created for the same user, resulting in two
  connection IDs. Because of this, the connection count was inaccurate and
  a user could remain online even after its one connection was removed. I fixed
  the duplicate connection so that only one SignalR connection is created
  during initialization.

3. A user closes their browser or loses network connectivity without disconnecting cleanly.
When the browser/tab closes, the SignalR connection is terminated. React client is handling automatic reconnections...

4. If two users try to enter with the same name at the same time, I first check in the DB to see if a user with that name already exists.
However, that check alone isn't enough because two requests could happen concurrently and both could find that the name doesn't exist. To handle that case, I have a unique database constraint on the normalized name. SQL Server guarantees that this constraint is enforced even when multiple operations are happening concurrently, so only one of the requests can successfully create that username. (Right now nothing happens to
that second request exception that will be thrown)

5. Names that differ only by case or surrounding whitespace: `dj`, `DJ`, `" DJ "`.
   Included a col in db by users called NormalizedName before entering a User it normalizes it by putting it into UPPERCASE and trimming it, this way when a user tries to join with a diff casing or space at end etc it will normalize before comparing it to other saved users

6. Empty or whitespace-only messages. Extremely long messages.
   -Can add for UX to the FE if message is empty dont send it
   -Can add check on BE as well

7. Server restart: Users and messages are persisted in SQL Server, so they survive a server restart. SignalR connections do not. After a restart, existing connections are lost and users are considered offline until their clients establish new SignalR connections.

8. Chat History Grows with Time


More Time:
1. Broadcasting AddUser at the end of the Join API
- any connected signalR connections will have the updated user
-but that specific user/ client does not yet have their signalR connection started, so invoking AddUser essentially does nothing for that user
(For now calling getUsers so that clients state will be updated)
2. Add pagination for loading messages (case where there are 1000 messages)
3. More server side and client side error handling
4. Direct Messaging
  



