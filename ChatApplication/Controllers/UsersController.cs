
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
        public async Task<IActionResult> Join(UserJoinRequest req)
        {
            var newUser = new User
            {
                Name = req.Name,
                NormalizedName = req.Name.ToUpper()
            };
            var user = await _userService.JoinAsync(newUser);
            return Ok(user);
        }
    }
}