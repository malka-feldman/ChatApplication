
using ChatApp.Services;
using ChatApplication.Models;
using Microsoft.AspNetCore.Mvc;

namespace ChatApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly UserService _userService;

        public UsersController(UserService userService)
        {
            _userService = userService;
        }

        [HttpGet]
        public async Task<IActionResult> GetUsers()
        {
            var users = await _userService.GetUsersAsync();
            return Ok(users);
        }


        [HttpPost("Join")]
        public async Task<IActionResult> Join(User userJoining)
        {
            var user = await _userService.JoinAsync(userJoining);
            return Ok(user);
        }
    }
}