using Azure.Core;
using ChatApplication.Data;
using ChatApplication.Models;
using Microsoft.EntityFrameworkCore;

namespace ChatApp.Services
{
    public class MessageService
    {
        private readonly ChatAppDbContext _context;

        public MessageService(ChatAppDbContext context)
        {
            _context = context;
        }

        public async Task<List<MessageResponse>> GetMessagesAsync()
        {
            return await _context.Messages
                .Include(m => m.User)
                .Select(m => new MessageResponse
                {
                    Id = m.Id,
                    UserId = m.UserId,
                    UserName = m.User.Name,
                    Body = m.Body,
                    SentAt = m.SentAt
                })
                .ToListAsync();
        }

        public async Task<MessageResponse> CreateMessageAsync(MessageRequest req)
        {
            var message = new Message
            {
                UserId = req.UserId,
                Body = req.Body,
                SentAt = DateTime.UtcNow
            };
            _context.Messages.Add(message);
            await _context.SaveChangesAsync();
            var messageResponse = await _context.Messages
                .Where(m => m.Id == message.Id)
                .Select(m => new MessageResponse
                {
                    Id = m.Id,
                    UserId = m.UserId,
                    UserName = m.User.Name,
                    Body = m.Body,
                    SentAt = m.SentAt
                })
                .FirstAsync();
            return messageResponse;
        }
    }
}