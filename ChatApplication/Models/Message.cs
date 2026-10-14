namespace ChatApplication.Models
{
    public class Message
    {
        public int Id { get; set; }

        public int UserId { get; set; }

        public User User { get; set; }
        public string Body { get; set; }

        public DateTime SentAt { get; set; }

        public int? RecipientId { get; set; }

        public User Recipient { get; set; }
    }

    public class MessageResponse
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string UserName { get; set; }
        public string Body { get; set; }
        public DateTime SentAt { get; set; }
        public int? RecipientId { get; set; }
        public string RecipientName { get; set; }
    }

    public class MessageRequest
    {
        public int UserId { get; set; }
        public string Body { get; set; }
        public int? RecipientId { get; set; }
    }

}