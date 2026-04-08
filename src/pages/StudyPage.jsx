import { useParams } from 'react-router-dom';
import StudySession from '../components/flashcards/StudySession';
import './PageStyles.css';

export default function StudyPage() {
  const { deckId, folderId } = useParams();

  return (
    <div className="page">
      <StudySession deckId={deckId} folderId={folderId} />
    </div>
  );
}
