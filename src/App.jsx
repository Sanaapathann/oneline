import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import { FaThumbsUp, FaSearch, FaPaperPlane, FaHashtag } from 'react-icons/fa';

function App() {
  //States
  const [search, setSearch] = useState('');
  const [content, setContent] = useState('');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  //Anonymous User ID stored in localStorage
  useEffect(() => {
    const storedId = localStorage.getItem('anon_user_id');
    if (storedId) {
      setUserId(storedId);
    } else {
      const newId = crypto.randomUUID();
      localStorage.setItem('anon_user_id', newId);
      setUserId(newId);
    }
  }, []);

  //Fetch Posts with Upvote Counts
  const fetchPostsWithVotes = async () => {
    setLoading(true);

    const { data: postsData, error: postErr } = await supabase
      .from('oneline_posts')
      .select('*')
      .order('created_at', { ascending: false });

    const { data: votesData, error: voteErr } = await supabase
      .from('oneline_votes')
      .select('post_id');

    if (postErr || voteErr) {
      console.error(postErr || voteErr);
      setLoading(false);
      return;
    }

    //Count Upvotes
    const voteMap = {};
    (votesData || []).forEach(({ post_id }) => {
      voteMap[post_id] = (voteMap[post_id] || 0) + 1;
    });

    const postsWithVotes = postsData.map((post) => ({
      ...post,
      upvotes: voteMap[post.id] || 0,
    }));

    setPosts(postsWithVotes);
    setLoading(false);
  };

  useEffect(() => {
    fetchPostsWithVotes();
  }, []);

  //Handle New Post
  const handlePost = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    const tags = content
      .split(' ')
      .filter((word) => word.startsWith('#'))
      .map((tag) => tag.slice(1).toLowerCase());

    const { error } = await supabase.from('oneline_posts').insert([
      {
        content,
        tags: tags.length > 0 ? tags : ['random'],
      },
    ]);

    if (error) {
      console.error('Insert error:', error);
      return;
    }

    setContent('');
    await fetchPostsWithVotes();
  };

  //Handle Upvote
  const handleUpvote = async (e, postId) => {
    e.preventDefault();
    if (!userId) return;

    const { error } = await supabase.from('oneline_votes').insert([
      {
        user_id: userId,
        post_id: postId,
      },
    ]);

    if (error) {
      console.error('Vote error:', error);
      return;
    }

    await fetchPostsWithVotes();
  };

  //Filtered Posts by Tag
  const filtered = posts.filter((post) =>
    post.tags?.some((tag) => tag.includes(search.toLowerCase()))
  );

 return (
    <div className="relative min-h-screen w-full overflow-x-hidden" style={{ fontFamily: "'Gabarito', sans-serif" }}>
      {/* Fixed Background Pattern */}
      <div 
        className="fixed inset-0 -z-10"
        style={{
          backgroundColor: '#DFDBE5',
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='52' height='26' viewBox='0 0 52 26' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.4'%3E%3Cpath d='M10 10c0-2.21-1.79-4-4-4-3.314 0-6-2.686-6-6h2c0 2.21 1.79 4 4 4 3.314 0 6 2.686 6 6 0 2.21 1.79 4 4 4 3.314 0 6 2.686 6 6 0 2.21 1.79 4 4 4v2c-3.314 0-6-2.686-6-6 0-2.21-1.79-4-4-4-3.314 0-6-2.686-6-6zm25.464-1.95l8.486 8.486-1.414 1.414-8.486-8.486 1.414-1.414z' /%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundAttachment: 'fixed',
          backgroundSize: 'auto'
        }}
      />

      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-10 backdrop-blur-lg bg-white/30 border-b border-white/20 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 w-full">
          {/* Title with spacing */}
          <div className="text-center text-6xl font-extrabold text-[#231942] pt-6 pb-4" style={{ fontFamily: "'Audiowide', cursive" }}>
            OneLine
          </div>
          
          {/* Inputs with spacing */}
          <div className="flex flex-col md:flex-row gap-6 pb-6 items-center w-full">
            <div className="w-full relative">
              <FaSearch className="absolute left-3 top-3 text-[#5e548e]/80" />
              <input
                type="text"
                placeholder="Find #tags or words..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-full bg-white/80 border border-[#5e548e]/30 focus:outline-none focus:ring-2 focus:ring-[#9f86c0] text-[#231942] shadow"
                style={{ fontFamily: "'Gabarito', sans-serif" }}
              />
            </div>
            <form onSubmit={handlePost} className="w-full relative">
              <FaHashtag className="absolute left-3 top-3 text-[#5e548e]/80" />
              <input
                type="text"
                placeholder="Share your thought #withTags..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full pl-10 pr-12 py-3 rounded-full bg-white/80 border border-[#5e548e]/30 focus:outline-none focus:ring-2 focus:ring-[#9f86c0] text-[#231942] shadow"
                style={{ fontFamily: "'Gabarito', sans-serif" }}
              />
              <button
                type="submit"
                className="absolute right-2 top-2 bg-[#5e548e] hover:bg-[#231942] text-white p-2 rounded-full shadow"
              >
                <FaPaperPlane />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Posts Grid - Full width */}
      <div className="pt-60 pb-8 w-full px-4">
        <div className="w-full max-w-none mx-0">
          {loading ? (
            <div className="text-center text-[#5e548e] py-8">
              Loading posts...
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center text-[#5e548e] py-8">
              No posts yet. Be the first to share!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full">
              {(search ? filtered : posts).map((post) => (
                <div
                  key={post.id}
                  className="bg-white/40 backdrop-blur-lg border border-white/30 rounded-xl p-5 shadow hover:shadow-lg transition h-full flex flex-col break-words w-full"
                >
                  <p className="text-lg font-medium text-[#231942] mb-3 break-words">
                    {post.content}
                  </p>
                  <div className="mt-auto">
                    <div className="text-sm text-[#5e548e] flex flex-wrap gap-2 mb-4">
                      {post.tags?.map((tag) => (
                        <span
                          key={tag}
                          className="bg-[#be95c4]/30 px-2 py-1 rounded-full flex items-center"
                        >
                          <FaHashtag className="mr-1" />{tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-sm text-[#5e548e]">
                      <button
                        onClick={(e) => handleUpvote(e, post.id)}
                        className="text-[#9f86c0] hover:text-[#5e548e] flex items-center gap-1"
                      >
                        <FaThumbsUp /> Upvote
                      </button>
                      <span>{post.upvotes || 0} upvotes</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;