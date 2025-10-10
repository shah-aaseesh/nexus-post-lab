-- Update reaction types to include more options like Facebook
ALTER TYPE reaction_type ADD VALUE IF NOT EXISTS 'love';
ALTER TYPE reaction_type ADD VALUE IF NOT EXISTS 'haha';
ALTER TYPE reaction_type ADD VALUE IF NOT EXISTS 'wow';
ALTER TYPE reaction_type ADD VALUE IF NOT EXISTS 'sad';
ALTER TYPE reaction_type ADD VALUE IF NOT EXISTS 'angry';

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- Enable realtime for posts
ALTER PUBLICATION supabase_realtime ADD TABLE posts;

-- Enable realtime for reactions
ALTER PUBLICATION supabase_realtime ADD TABLE reactions;

-- Enable realtime for comments
ALTER PUBLICATION supabase_realtime ADD TABLE comments;