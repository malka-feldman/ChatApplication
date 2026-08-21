using Microsoft.AspNetCore.SignalR;
using System.Collections.Concurrent;

namespace ChatApplication.Hubs
{
    public class ChatHub : Hub
    {
        private static readonly ConcurrentDictionary<int, HashSet<string>> OnlineUsers = new();

        public async Task JoinChat(int userId)
        {
            var connections = OnlineUsers.GetOrAdd(
                userId,
                _ => new HashSet<string>()
            );

            lock (connections)
            {
                connections.Add(Context.ConnectionId);
            }

            // Tell everyone this user is online
            await Clients.All.SendAsync("UserOnline", userId);

            // Tell this connection who is currently online
            await Clients.Caller.SendAsync(
                "CurrentlyOnline",
                OnlineUsers.Keys
            );
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            foreach (var user in OnlineUsers)
            {
                var userId = user.Key;
                var connections = user.Value;

                bool removed;

                lock (connections)
                {
                    removed = connections.Remove(Context.ConnectionId);

                    // If this was their last connection, they're actually offline
                    if (connections.Count == 0)
                    {
                        OnlineUsers.TryRemove(userId, out _);
                    }
                }

                if (removed && !OnlineUsers.ContainsKey(userId))
                {
                    await Clients.All.SendAsync("UserOffline", userId);
                }
            }

            await base.OnDisconnectedAsync(exception);
        }
    }
}