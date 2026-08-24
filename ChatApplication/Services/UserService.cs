using ChatApplication.Data;
using ChatApplication.Models;
using Microsoft.EntityFrameworkCore;

namespace ChatApp.Services
{
    public class UserService
    {
        private readonly ChatAppDbContext _context;
        public UserService(ChatAppDbContext context)
        {
            _context = context;
        }

        public async Task<List<User>> GetUsersAsync()
        {
            return await _context.Users.ToListAsync();
        }

        public async Task<(bool, User)> JoinAsync(User userJoining)
        {
            var normalizedName = userJoining.Name.Trim().ToUpperInvariant();
            bool isNew = false;
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.NormalizedName == normalizedName);

            if (user == null)
            {
                isNew = true;
                user = new User
                {
                    Name = userJoining.Name.Trim(),
                    NormalizedName = normalizedName,
                    JoinedOn = DateTime.UtcNow
                };

                _context.Users.Add(user);
                await _context.SaveChangesAsync();
            }
            return (isNew, user);
        }
    }
}