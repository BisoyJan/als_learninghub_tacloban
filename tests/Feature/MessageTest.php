<?php

namespace Tests\Feature;

use App\Models\Message;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MessageTest extends TestCase
{
    use RefreshDatabase;

    private User $teacher;
    private User $student;
    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->teacher = User::factory()->create(['role' => 'teacher', 'is_active' => true]);
        $this->student = User::factory()->create(['role' => 'student', 'is_active' => true]);
        $this->admin = User::factory()->create(['role' => 'admin', 'is_active' => true]);
    }

    // ---------- Authorization: index ----------

    public function test_guests_cannot_access_messages()
    {
        $this->get(route('messages.index'))->assertRedirect(route('login'));
    }

    public function test_authenticated_user_can_view_messages()
    {
        $response = $this->actingAs($this->student)->get(route('messages.index'));
        $response->assertOk();
        $response->assertInertia(fn ($page) => $page->component('messages/index'));
    }

    public function test_inbox_shows_received_messages()
    {
        Message::create([
            'sender_id' => $this->teacher->id,
            'recipient_id' => $this->student->id,
            'subject' => 'Hello',
            'body' => 'Welcome to the class.',
        ]);

        $this->actingAs($this->student)
            ->get(route('messages.index'))
            ->assertInertia(fn ($page) => $page->has('inbox.data', 1));
    }

    public function test_sent_shows_sent_messages()
    {
        Message::create([
            'sender_id' => $this->student->id,
            'recipient_id' => $this->teacher->id,
            'body' => 'Question about homework.',
        ]);

        $this->actingAs($this->student)
            ->get(route('messages.index'))
            ->assertInertia(fn ($page) => $page->has('sent.data', 1));
    }

    public function test_unread_count_is_correct()
    {
        Message::create([
            'sender_id' => $this->teacher->id,
            'recipient_id' => $this->student->id,
            'body' => 'Unread message.',
            'read_at' => null,
        ]);
        Message::create([
            'sender_id' => $this->teacher->id,
            'recipient_id' => $this->student->id,
            'body' => 'Already read.',
            'read_at' => now(),
        ]);

        $this->actingAs($this->student)
            ->get(route('messages.index'))
            ->assertInertia(fn ($page) => $page->where('unreadCount', 1));
    }

    // ---------- Store ----------

    public function test_student_can_send_message_to_teacher()
    {
        $response = $this->actingAs($this->student)->post(route('messages.store'), [
            'recipient_id' => $this->teacher->id,
            'subject' => 'Help needed',
            'body' => 'I have a question about the module.',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('messages', [
            'sender_id' => $this->student->id,
            'recipient_id' => $this->teacher->id,
            'subject' => 'Help needed',
        ]);
    }

    public function test_teacher_can_send_message_to_student()
    {
        $response = $this->actingAs($this->teacher)->post(route('messages.store'), [
            'recipient_id' => $this->student->id,
            'body' => 'Good work on your assignment.',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('messages', [
            'sender_id' => $this->teacher->id,
            'recipient_id' => $this->student->id,
        ]);
    }

    public function test_self_messaging_is_prevented()
    {
        $response = $this->actingAs($this->student)->post(route('messages.store'), [
            'recipient_id' => $this->student->id,
            'body' => 'Note to self.',
        ]);

        $response->assertSessionHasErrors('recipient_id');
        $this->assertDatabaseCount('messages', 0);
    }

    public function test_store_validates_required_fields()
    {
        $this->actingAs($this->student)
            ->post(route('messages.store'), [])
            ->assertSessionHasErrors(['recipient_id', 'body']);
    }

    public function test_store_validates_body_not_empty()
    {
        $this->actingAs($this->student)
            ->post(route('messages.store'), [
                'recipient_id' => $this->teacher->id,
                'body' => '',
            ])
            ->assertSessionHasErrors('body');
    }

    public function test_store_rejects_nonexistent_recipient()
    {
        $this->actingAs($this->student)
            ->post(route('messages.store'), [
                'recipient_id' => 99999,
                'body' => 'Hello.',
            ])
            ->assertSessionHasErrors('recipient_id');
    }

    // ---------- Mark Read ----------

    public function test_recipient_can_mark_message_as_read()
    {
        $message = Message::create([
            'sender_id' => $this->teacher->id,
            'recipient_id' => $this->student->id,
            'body' => 'Hello.',
            'read_at' => null,
        ]);

        $this->actingAs($this->student)
            ->patch(route('messages.read', $message))
            ->assertRedirect();

        $this->assertNotNull($message->fresh()->read_at);
    }

    public function test_non_recipient_cannot_mark_message_as_read()
    {
        $message = Message::create([
            'sender_id' => $this->teacher->id,
            'recipient_id' => $this->student->id,
            'body' => 'Hello.',
        ]);

        $otherStudent = User::factory()->create(['role' => 'student']);

        $this->actingAs($otherStudent)
            ->patch(route('messages.read', $message))
            ->assertForbidden();
    }

    public function test_marking_already_read_message_is_idempotent()
    {
        $readAt = now()->subHour();
        $message = Message::create([
            'sender_id' => $this->teacher->id,
            'recipient_id' => $this->student->id,
            'body' => 'Hello.',
            'read_at' => $readAt,
        ]);

        $this->actingAs($this->student)
            ->patch(route('messages.read', $message));

        // read_at should not change if already set
        $this->assertEquals(
            $readAt->toDateTimeString(),
            $message->fresh()->read_at->toDateTimeString()
        );
    }

    // ---------- Destroy ----------

    public function test_sender_can_delete_message()
    {
        $message = Message::create([
            'sender_id' => $this->teacher->id,
            'recipient_id' => $this->student->id,
            'body' => 'Delete me.',
        ]);

        $this->actingAs($this->teacher)
            ->delete(route('messages.destroy', $message))
            ->assertRedirect();

        $this->assertDatabaseMissing('messages', ['id' => $message->id]);
    }

    public function test_recipient_can_delete_message()
    {
        $message = Message::create([
            'sender_id' => $this->teacher->id,
            'recipient_id' => $this->student->id,
            'body' => 'Delete me.',
        ]);

        $this->actingAs($this->student)
            ->delete(route('messages.destroy', $message))
            ->assertRedirect();

        $this->assertDatabaseMissing('messages', ['id' => $message->id]);
    }

    public function test_third_party_cannot_delete_message()
    {
        $message = Message::create([
            'sender_id' => $this->teacher->id,
            'recipient_id' => $this->student->id,
            'body' => 'Private.',
        ]);

        $other = User::factory()->create(['role' => 'student']);

        $this->actingAs($other)
            ->delete(route('messages.destroy', $message))
            ->assertForbidden();

        $this->assertDatabaseHas('messages', ['id' => $message->id]);
    }

    // ---------- Recipients list ----------

    public function test_student_recipients_list_contains_only_teachers_and_admins()
    {
        $this->actingAs($this->student)
            ->get(route('messages.index'))
            ->assertInertia(fn ($page) => $page
                ->where('recipients.0.role', fn ($role) => in_array($role, ['teacher', 'admin']))
            );
    }
}
