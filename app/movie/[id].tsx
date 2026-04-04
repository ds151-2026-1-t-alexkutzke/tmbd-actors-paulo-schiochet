import { Link, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator, ScrollView, FlatList, Pressable } from 'react-native';
import { api } from '../../src/api/tmdb';

interface MovieDetails {
  title: string;
  overview: string;
  poster_path: string | null;
  vote_average: number;
  runtime: number;
}

interface CastMember {
  id: string;
  name: string;
  character: string;
  profile_path: string | null;
}

function CastCard({ name, character, profile_path }: CastMember) {
  return (
    <View style={styles.castCard}>
      {profile_path ? (
        <Image
          source={{ uri: `https://image.tmdb.org/t/p/w185${profile_path}` }}
          style={styles.castPhoto}
        />
      ) : (
        <View style={styles.castPhotoEmpty}>
          <Text style={styles.castPhotoEmptyText}>Sem{'\n'}Foto</Text>
        </View>
      )}
      <Text style={styles.castName} numberOfLines={2}>
        {name}
      </Text>
      <Text style={styles.castCharacter} numberOfLines={1}>
        {character}
      </Text>
    </View>
  );
}

export default function MovieDetailsScreen() {
  const { id } = useLocalSearchParams();
  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [cast, setCast] = useState<CastMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        const movieDetails = await api.get(`/movie/${id}`);
        setMovie(movieDetails.data);

        const castDetails = await api.get(`/movie/${id}/credits`);
        setCast(castDetails.data.cast);
      } catch (error) {
        console.error('Erro ao buscar detalhes:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovieDetails();
  }, [id]);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#E50914" />
      </View>
    );
  }

  if (!movie) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Filme não encontrado.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {movie.poster_path && (
        <Image
          source={{
            uri: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
          }}
          style={styles.poster}
          resizeMode="cover"
        />
      )}
      <View style={styles.content}>
        <Text style={styles.title}>{movie.title}</Text>

        <View style={styles.statsContainer}>
          <Text style={styles.statText}>⭐ {movie.vote_average.toFixed(1)}/10</Text>
          <Text style={styles.statText}>⏱️ {movie.runtime} min</Text>
        </View>

        <Text style={styles.sectionTitle}>Sinopse</Text>
        <Text style={styles.overview}>
          {movie.overview || 'Sinopse não disponível para este filme.'}
        </Text>

        <Text style={styles.sectionTitle}>Elenco</Text>
        <FlatList
          data={cast}
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Link href={`/actor/${item.id}`} asChild>
              <Pressable>
                <CastCard {...item} />
              </Pressable>
            </Link>
          )}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  poster: { width: '100%', height: 400 },
  content: { padding: 20 },
  title: { color: '#FFFFFF', fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  statsContainer: { flexDirection: 'row', gap: 16, marginBottom: 24 },
  statText: { color: '#E50914', fontSize: 16, fontWeight: '600' },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 10
  },
  overview: { color: '#D1D5DB', fontSize: 16, lineHeight: 24 },
  errorText: { color: '#FFFFFF', fontSize: 18 },
  castCard: { width: 110, marginRight: 12, alignItems: 'center' },
  castPhoto: { width: 90, height: 90, borderRadius: 45, marginBottom: 6 },
  castPhotoEmpty: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#333333',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6
  },
  castPhotoEmptyText: { color: '#9CA3AF', fontSize: 11, textAlign: 'center' },
  castName: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 2
  },
  castCharacter: { color: '#9CA3AF', fontSize: 11, textAlign: 'center' },
});
