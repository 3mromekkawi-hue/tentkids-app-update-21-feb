
function StoryBubble({ avatarId, name, color, isAdd, onPress }: { avatarId?: string; name: string; color?: string; isAdd?: boolean; onPress?: () => void }) {
  return (
    <Pressable style={styles.storyBubble} onPress={onPress}>
      <View style={[styles.storyRing, { borderColor: color || Colors.primary }]}> 
        {isAdd ? (
          <View style={styles.storyAddInner}>
            <Ionicons name="add" size={24} color={Colors.primary} />
          </View>
        ) : avatarId ? (
          <Avatar avatarId={avatarId} size={52} />
        ) : null}
      </View>
      <Text style={styles.storyName} numberOfLines={1}>{name}</Text>
    </Pressable>
  );
}

export default function CookiesScreen() {
  const { t, isRTL, profile, posts, stories } = useApp();
  const { session } = useAuth();
  const insets = useSafeAreaInsets();
  const [showSweets, setShowSweets] = useState(true);

  const visiblePosts = posts.filter(p => !p.reported);

  React.useEffect(() => {
    const timer = setTimeout(() => setShowSweets(false), 3500);
    return () => clearTimeout(timer);
  }, []);

  const renderHeader = () => (
    <View>
      <View style={[styles.headerBar, isRTL && styles.headerBarRTL]}>
        <View style={[styles.headerLeft, isRTL && { alignItems: 'flex-end' }]}> 
          <Text style={[styles.appName, isRTL && styles.rtl]}>{t('appName')}</Text>
        </View>
        <Pressable onPress={() => router.push('/mytent')} style={styles.profileBtn}>
          {profile && <Avatar avatarId={profile.avatarId} size={38} />}
        </Pressable>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.storiesRow, isRTL && { flexDirection: 'row-reverse' }]}> 
        <StoryBubble isAdd name={t('addStory')} onPress={() => router.push('/(tabs)/add')} />
        {stories.map(s => (
          <StoryBubble key={s.id} avatarId={s.authorAvatarId} name={s.authorNickname} color={s.color} />
        ))}
      </ScrollView>
      <View style={styles.storiesDivider} />
    </View>
  );

  return (
    <LinearGradient colors={[Colors.background, '#FFE4F0', '#F0E4FF', Colors.background]} style={styles.container}>
      {showSweets && <FallingSweets count={18} />}
      <View style={{ paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 0) }}>
        <FlatList
          data={visiblePosts}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <PostCard post={item} />}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={[styles.listContent, { paddingBottom: 100 }, visiblePosts.length === 0 && styles.emptyList]}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="cookie" size={64} color={Colors.textMuted} />
              <Text style={[styles.emptyTitle, isRTL && styles.rtl]}>{t('noPostsYet')}</Text>
              <Text style={[styles.emptySub, isRTL && styles.rtl]}>{t('beFirstToPost')}</Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingVertical: 10 },
  headerBarRTL: { flexDirection: 'row-reverse' },
  headerLeft: { flex: 1 },
  appName: { fontSize: 24, fontWeight: '800' as const, color: Colors.text },
  rtl: { textAlign: 'right', writingDirection: 'rtl' },
  profileBtn: { padding: 2 },
  storiesRow: { paddingHorizontal: 14, gap: 12, paddingVertical: 8 },
  storyBubble: { alignItems: 'center', width: 70, gap: 4 },
  storyRing: { width: 60, height: 60, borderRadius: 30, borderWidth: 2.5, justifyContent: 'center', alignItems: 'center', padding: 2 },
  storyAddInner: { width: 52, height: 52, borderRadius: 26, backgroundColor: 'rgba(255,107,138,0.08)', justifyContent: 'center', alignItems: 'center' },
  storyName: { fontSize: 11, color: Colors.textSecondary, fontWeight: '500' as const },
  storiesDivider: { height: 1, backgroundColor: 'rgba(0,0,0,0.05)', marginHorizontal: 16 },
  listContent: { paddingHorizontal: 16, paddingTop: 8 },
  emptyList: { flexGrow: 1 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, paddingVertical: 80 },
  emptyTitle: { fontSize: 18, fontWeight: '600' as const, color: Colors.text },
  emptySub: { fontSize: 14, color: Colors.textSecondary },
});
