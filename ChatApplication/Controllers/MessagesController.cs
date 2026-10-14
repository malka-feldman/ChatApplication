using ChatApp.Services;
using ChatApplication.Hubs;
using ChatApplication.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;

namespace ChatApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MessagesController : ControllerBase
    {
        private readonly MessageService _messageService;
        private readonly IHubContext<ChatHub> _hubContext;
        public MessagesController(MessageService messageService, IHubContext<ChatHub> hubContext)
        {
            _hubContext = hubContext;
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

            if (request.RecipientId.HasValue)
            {
                // Direct message: deliver only to the sender and recipient
                var targetConnections = ChatHub.GetConnections(request.UserId)
                    .Concat(ChatHub.GetConnections(request.RecipientId.Value))
                    .Distinct();
                foreach (var connId in targetConnections)
                {
                    await _hubContext.Clients.Client(connId)
                        .SendAsync("ReceiveMessage", msgResponse);
                }
            }
            else
            {
                await _hubContext.Clients.All.SendAsync("ReceiveMessage", msgResponse);
            }

            return Ok(msgResponse);
        }
    }
}