using ChatApp.Services;
using ChatApplication.Models;
using Microsoft.AspNetCore.Mvc;

namespace ChatApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MessagesController : ControllerBase
    {
        private readonly MessageService _messageService;

        public MessagesController(
    MessageService messageService)
        {
            _messageService = messageService;
        }

        [HttpGet]
        public async Task<IActionResult> GetMessages()
        {
            var messages = await _messageService.GetMessagesAsync();
            return Ok(messages);
        }

        [HttpPost]
        public async Task<IActionResult> CreateMessage(MessageRequest request)
        {

            var msgResponse = await _messageService.CreateMessageAsync(request);
            return Ok(msgResponse);
        }
    }
}