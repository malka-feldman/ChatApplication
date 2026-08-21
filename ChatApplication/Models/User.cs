namespace ChatApplication.Models
{
    public class User
    {
        public int Id { get; set; }

        public string Name { get; set; }

        public string NormalizedName { get; set; }

        public DateTime JoinedOn { get; set; }

        public List<Message> Messages { get; set; } = new List<Message>();
    }

    public class UserJoinRequest
    {
        public string Name { get; set; }
    }

}