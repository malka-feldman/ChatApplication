
using ChatApp.Services;
using ChatApplication.Hubs;
using ChatApplication.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;

namespace ChatApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly UserService _userService;
        private readonly IHubContext<ChatHub> _hubContext;
        public UsersController(UserService userService, IHubContext<ChatHub> hubContext)
        {
            _hubContext = hubContext;
            _userService = userService;
        }

        [HttpGet]
        public async Task<IActionResult> GetUsers()
        {
            var users = await _userService.GetUsersAsync();
            return Ok(users);
        }


        [HttpPost("Join")]
        public async Task<IActionResult> Join(UserJoinRequest req)
        {
            var newUser = new User
            {
                Name = req.Name,
                NormalizedName = req.Name.ToUpper()
            };
            var user = await _userService.JoinAsync(newUser);
            await _hubContext.Clients.All.SendAsync("AddUser", user);
            return Ok(user);
        }
    }
}