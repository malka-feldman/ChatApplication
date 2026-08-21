namespace ChatApplication.Models
{
    public class Message
    {
        public int Id { get; set; }

        public int UserId { get; set; }

        public User User { get; set; }
        public string Body { get; set; }

        public DateTime SentAt { get; set; }
        public string UserName { get; internal set; }
    }

    public class MessageResponse
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string UserName { get; set; }
        public string Body { get; set; }
        public DateTime SentAt { get; set; }
    }

}