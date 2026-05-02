import { ClipboardList, Plus, Users, Eye, Edit, Trash2 } from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { getCommunityPolls, createCommunityPoll, updateCommunityPoll, deleteCommunityPoll, voteInPoll, getPollVotes } from '../data/firebaseData';
import { useAuth } from '../auth/FirebaseAuthContext';
import styles from './CommunityPollsPage.module.css';

export function CommunityPollsPage() {
  const { user } = useAuth();
  const role = user?.role;

  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPoll, setEditingPoll] = useState(null);
  const [showVotesModal, setShowVotesModal] = useState(false);
  const [selectedPollVotes, setSelectedPollVotes] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [pollToDelete, setPollToDelete] = useState(null);
  const [formData, setFormData] = useState({
    question: '',
    options: ['', ''],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'Open'
  });

  useEffect(() => {
    loadPolls();
  }, []);

  const loadPolls = async () => {
    try {
      const data = await getCommunityPolls();
      setPolls(data);
    } catch (error) {
      console.error('Error loading polls:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    const open = polls.filter((p) => p.status === 'Open').length;
    return { open, total: polls.length };
  }, [polls]);

  const togglePollStatus = async (pollId) => {
    try {
      const poll = polls.find(p => p.id === pollId);
      const newStatus = poll.status === 'Open' ? 'Closed' : 'Open';
      await updateCommunityPoll(pollId, { status: newStatus });
      loadPolls();
    } catch (error) {
      console.error('Error updating poll status:', error);
      alert('Failed to update poll status. Please try again.');
    }
  };

  const handleVote = async (pollId, optionIndex) => {
    try {
      const result = await voteInPoll(pollId, optionIndex, user?.email);
      if (result.ok) {
        loadPolls();
        alert('Vote submitted successfully!');
      } else {
        alert(result.error || 'Failed to submit vote');
      }
    } catch (error) {
      console.error('Error voting:', error);
      alert('Failed to submit vote. Please try again.');
    }
  };

  const handleAddOption = () => {
    setFormData(prev => ({
      ...prev,
      options: [...prev.options, '']
    }));
  };

  const handleRemoveOption = (index) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }));
  };

  const handleOptionChange = (index, value) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => i === index ? value : opt)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const pollData = {
        question: formData.question,
        options: formData.options.map(opt => ({ text: opt, votes: 0, voters: [] })),
        endDate: formData.endDate,
        status: formData.status,
        createdBy: user?.email
      };

      if (editingPoll) {
        await updateCommunityPoll(editingPoll.id, pollData);
      } else {
        await createCommunityPoll(pollData);
      }

      setShowAddModal(false);
      setEditingPoll(null);
      setFormData({
        question: '',
        options: ['', ''],
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'Open'
      });
      loadPolls();
    } catch (error) {
      console.error('Error saving poll:', error);
      alert('Failed to save poll. Please try again.');
    }
  };

  const handleEdit = (poll) => {
    setEditingPoll(poll);
    setFormData({
      question: poll.question || '',
      options: poll.options?.map(opt => opt.text) || ['', ''],
      endDate: poll.endDate || new Date().toISOString().split('T')[0],
      status: poll.status || 'Open'
    });
    setShowAddModal(true);
  };

  const handleDelete = (id) => {
    setPollToDelete(id);
    setShowDeleteConfirm(true);
  };

  const confirmDeletePoll = async () => {
    if (pollToDelete) {
      try {
        await deleteCommunityPoll(pollToDelete);
        loadPolls();
        setShowDeleteConfirm(false);
        setPollToDelete(null);
      } catch (error) {
        console.error('Error deleting poll:', error);
        alert('Failed to delete poll. Please try again.');
      }
    }
  };

  const cancelDeletePoll = () => {
    setShowDeleteConfirm(false);
    setPollToDelete(null);
  };

  const handleViewVotes = async (poll) => {
    try {
      const result = await getPollVotes(poll.id);
      if (result.ok) {
        setSelectedPollVotes({
          poll: poll,
          votes: result.data
        });
        setShowVotesModal(true);
      } else {
        alert('Failed to load votes');
      }
    } catch (error) {
      console.error('Error loading votes:', error);
      alert('Failed to load votes. Please try again.');
    }
  };

  if (loading) {
    return <div className={styles.page}>Loading polls...</div>;
  }

  
  return (
    <div className={styles.page}>
      {/* Add/Edit Poll Modal */}
      {showAddModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>{editingPoll ? 'Edit Poll' : 'Create New Poll'}</h3>
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label>Poll Question</label>
                <input
                  type="text"
                  value={formData.question}
                  onChange={(e) => setFormData({...formData, question: e.target.value})}
                  placeholder="What should be the pool opening time?"
                  required
                />
              </div>
              
              <div className={styles.formGroup}>
                <label>Options</label>
                {formData.options.map((option, index) => (
                  <div key={index} className={styles.optionGroup}>
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      placeholder={`Option ${index + 1}`}
                      required
                    />
                    {formData.options.length > 2 && (
                      <Button type="button" variant="ghost" onClick={() => handleRemoveOption(index)}>
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
                <Button type="button" variant="ghost" onClick={handleAddOption}>
                  + Add Option
                </Button>
              </div>
              
              <div className={styles.formGroup}>
                <label>End Date</label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                  required
                />
              </div>
              
              <div className={styles.formGroup}>
                <label>Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  required
                >
                  <option value="Open">Open</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
              
              <div className={styles.modalActions}>
                <Button type="submit">
                  {editingPoll ? 'Update' : 'Create'} Poll
                </Button>
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingPoll(null);
                    setFormData({
                      question: '',
                      options: ['', ''],
                      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                      status: 'Open'
                    });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Votes Modal */}
      {showVotesModal && selectedPollVotes && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>Votes for: {selectedPollVotes.poll.question}</h3>
            <div className={styles.votesList}>
              {selectedPollVotes.votes.map((vote, index) => (
                <div key={index} className={styles.voteItem}>
                  <span>{vote.userEmail}</span>
                  <span>{vote.optionText}</span>
                  <span>{new Date(vote.votedAt).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
            <div className={styles.modalActions}>
              <Button onClick={() => setShowVotesModal(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}

      <div className={styles.headerRow}>
        <div>
          <div className={styles.h1}>Community Polls</div>
          <div className={styles.sub}>Participate in community decisions</div>
        </div>
        {role === 'admin' && (
          <Button className={styles.pollBtn} onClick={() => setShowAddModal(true)}>
            <Plus size={14} />
            <span>New poll</span>
          </Button>
        )}
      </div>

      <div className={styles.statsGrid}>
        <Card
          title="Open Polls"
          right={<div className={`${styles.statIcon} ${styles.blue}`} aria-hidden="true"><ClipboardList size={18} /></div>}
        >
          <div className={styles.statValue}>{stats.open}</div>
          <div className={styles.statHint}>Ready for voting</div>
        </Card>
      </div>

      <div className={styles.pollGrid}>
        {polls.map((p) => {
          const totalVotes = p.options?.reduce((sum, o) => sum + (o.votes || 0), 0) || 1;
          return (
            <Card key={p.id} title="Poll" subtitle={`Ends: ${p.endDate}`}>
              <div className={styles.pollCard}>
                <div className={styles.question}>{p.question}</div>

                <div className={styles.options}>
                  {p.options?.map((o, index) => {
                    const pct = Math.round(((o.votes || 0) / totalVotes) * 100);
                    const hasVoted = p.votes?.some(vote => vote.userEmail === user?.email);
                    const userVote = p.votes?.find(vote => vote.userEmail === user?.email);
                    const isYour = userVote?.optionIndex === index;
                    return (
                      <div
                        key={index}
                        className={`${styles.optionRow} ${isYour ? styles.yourVote : ''} ${role === 'admin' ? '' : styles.voteable}`}
                        role={role === 'admin' ? undefined : 'button'}
                        tabIndex={role === 'admin' ? -1 : 0}
                        onClick={role === 'admin' ? undefined : () => handleVote(p.id, index)}
                      >
                        <div className={styles.optionTop}>
                          <span className={styles.optionLabel}>{o.text || o.option || 'Option'}</span>
                          <span className={styles.optionCount}>{o.votes || 0} votes</span>
                        </div>
                        <div className={styles.bar}>
                          <div className={styles.barFill} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className={styles.actions}>
                  {role === 'admin' ? (
                    <div className={styles.adminActions}>
                      <Button onClick={() => handleViewVotes(p)}><Eye size={14} /> View Votes</Button>
                      <Button onClick={() => handleEdit(p)}><Edit size={14} /> Edit</Button>
                      <Button onClick={() => togglePollStatus(p.id)}>{p.status === 'Open' ? 'Close poll' : 'Re-open poll'}</Button>
                      <Button onClick={() => handleDelete(p.id)} variant="ghost"><Trash2 size={14} /> Delete</Button>
                    </div>
                  ) : (
                    <div className={styles.voteHint}>
                      {p.status === 'Open' ? 'Click an option to vote' : 'Poll is closed'}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>Delete Poll</h3>
            <p>Are you sure you want to delete this poll? This action cannot be undone.</p>
            <div className={styles.modalActions}>
              <Button onClick={confirmDeletePoll}>Delete</Button>
              <Button variant="ghost" onClick={cancelDeletePoll}>Cancel</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

